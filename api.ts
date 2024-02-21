/**
 * Модуль для работы c API amoCRM
 * Модуль используется для работы в NodeJS.
 */

import axios from "axios"
import querystring from "querystring";
import fs from "fs";
import axiosRetry from "axios-retry";
import {config} from "./config"
import {logger} from "./logger";
import {
	ContactRes,
	ContactsUpdateData, CreateTaskData,
	DealRes,
	DealsUpdateData, PostTokenData,
	RequestQuery,
	Token
} from "./types";

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const AMO_TOKEN_PATH = "amo_token.json";

const LIMIT = 200;


export default new class Api{
	private access_token: null | string = null;
	private refresh_token: null | string = null;
	private ROOT_PATH: string = `https://${config.SUB_DOMAIN}.amocrm.ru`;

	private authChecker = <T, U>(request: (args: T) => Promise<U>): ((args: T) => Promise<U>) => {
		return (...args) => {
			if (!this.access_token) {
				return this.getAccessToken().then(() => this.authChecker(request)(...args));
			}
			return request(...args).catch((err) => {
				logger.error(err.response);
				logger.error(err);
				logger.error(err.response.data);
				const data = err.response.data;
				if ("validation-errors" in data) {
					data["validation-errors"].forEach(({ errors }: {errors: Error[]}) => logger.error(errors));
					logger.error("args", JSON.stringify(args, null, 2));
				}
				if (data.status == 401 && data.title === "Unauthorized") {
					logger.debug("Нужно обновить токен");
					return this.refreshToken().then(() => this.authChecker(request)(...args));
				}
				throw err;
			});
		};
	};

	private requestAccessToken = (): Promise<Token> => {
		return axios
			.post<Token>(`${this.ROOT_PATH}/oauth2/access_token`, {
				client_id: config.CLIENT_ID,
				client_secret: config.CLIENT_SECRET,
				grant_type: "authorization_code",
				code: config.AUTH_CODE,
				redirect_uri: config.REDIRECT_URI,
			})
			.then((res) => {
				logger.debug("Свежий токен получен");
				return res.data;
			})
			.catch((err) => {
				logger.error(err.response.data);
				throw err;
			});
	};

	public getAccessToken = async (): Promise<string> => {
		if (this.access_token) {
			return Promise.resolve(this.access_token);
		}
		try {
			const content = fs.readFileSync(AMO_TOKEN_PATH);
			const token = JSON.parse(content.toString());
			this.access_token = token.access_token;
			this.refresh_token = token.refresh_token;
			return Promise.resolve(token.access_token);
		} catch (error) {
			logger.error(`Ошибка при чтении файла ${AMO_TOKEN_PATH}`, error);
			logger.debug("Попытка заново получить токен");
			const token = await this.requestAccessToken();
			fs.writeFileSync(AMO_TOKEN_PATH, JSON.stringify(token));
			this.access_token = token.access_token;
			this.refresh_token = token.refresh_token;
			return Promise.resolve(token.access_token);
		}
	};
	private refreshToken = (): Promise<string> =>  {
		return axios
			.post(`${this.ROOT_PATH}/oauth2/access_token`, {
				client_id: config.CLIENT_ID,
				client_secret: config.CLIENT_SECRET,
				grant_type: "refresh_token",
				refresh_token: this.refresh_token,
				redirect_uri: config.REDIRECT_URI,
			})
			.then((res) => {
				logger.debug("Токен успешно обновлен");
				const token = res.data;
				fs.writeFileSync(AMO_TOKEN_PATH, JSON.stringify(token));
				this.access_token = token.access_token;
				this.refresh_token = token.refresh_token;
				return token;
			})
			.catch((err) => {
				logger.error("Не удалось обновить токен");
				logger.error(err.response.data);
			});
	};

	// Получить сделку по id
	public getDeal = this.authChecker<RequestQuery, DealRes>(({id, withParam = []}): Promise<DealRes> => {
		return axios
			.get<DealRes>(
				`${this.ROOT_PATH}/api/v4/leads/${id}?${querystring.encode({
					with: withParam.join(","),
				})}`,
				{
					headers: {
						Authorization: `Bearer ${this.access_token}`,
					},
				}
			)
			.then((res) => res.data);
	});
	// Получить сделки по фильтрам
	public getDeals = this.authChecker<RequestQuery, DealRes[]>(({ page = 1, limit = LIMIT, filters }): Promise<DealRes[]> => {
		const url = `${this.ROOT_PATH}/api/v4/leads?${querystring.stringify({
			page,
			limit,
			with: ["contacts"],
			filters,
		})}`;

		return axios
			.get(url, {
				headers: {
					Authorization: `Bearer ${this.access_token}`,
				},
			})
			.then((res) => {
				return res.data ? res.data._embedded.leads : [];
			});
	});

	// Обновить сделки
	public updateDeals = this.authChecker<DealsUpdateData, void>((data): Promise<void> => {
		return axios.patch(`${this.ROOT_PATH}/api/v4/leads`, [data], {
			headers: {
				Authorization: `Bearer ${this.access_token}`,
			},
		});
	});

	// Получить контакт по id
	public getContact = this.authChecker<number, ContactRes>((id: number): Promise<ContactRes> => {
		return axios
			.get<ContactRes>(`${this.ROOT_PATH}/api/v4/contacts/${id}?${querystring.stringify({
				with: ["leads"]
			})}`, {
				headers: {
					Authorization: `Bearer ${this.access_token}`,
				},
			})
			.then((res) => res.data);
	});

	// Обновить контакты
	public updateContacts = this.authChecker<ContactsUpdateData, void>((data): Promise<void> => {
		return axios.patch(`${this.ROOT_PATH}/api/v4/contacts`, [data], {
			headers: {
				Authorization: `Bearer ${this.access_token}`,
			},
		});
	});
	public createTask = this.authChecker<CreateTaskData, unknown>((data): Promise<unknown> => {
		return axios.post(`${this.ROOT_PATH}/api/v4/tasks`, [data], {
			headers: {
				Authorization: `Bearer ${this.access_token}`,
			},
		});
	});
	public getTasks = this.authChecker((): Promise<{_embedded: { tasks: [] }} > => {
		return axios.get(`${this.ROOT_PATH}/api/v4/tasks`, {
			headers: {
				Authorization: `Bearer ${this.access_token}`,
			},
		});
	});

}
