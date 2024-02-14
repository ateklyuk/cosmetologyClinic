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

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const AMO_TOKEN_PATH = "amo_token.json";

const LIMIT = 200;

type GetTokenRes = {
	token_type: string,
	expires_in: number,
	access_token: string,
	refresh_token: string
}
type GetDealRes = {
}
type GetDealsRes = {
	_page: number,
	_links: {},
	_embedded: {leads: Array<{}>}
}
type Request = {
	id?: number,
	limit?: number,
	page?: number,
	filters?: Array<number>,

}


export default function Api() {
	let access_token: null | String = null;
	let refresh_token: null | String = null;
	const ROOT_PATH: string = `https://${config.SUB_DOMAIN}.amocrm.ru`;

	const authChecker = (request: Request) => {
		return (...args) => {
			if (!access_token) {
				return this.getAccessToken().then(() => authChecker(request)(...args));
			}
			return request(...args).catch((err) => {
				logger.error(err.response);
				logger.error(err);
				logger.error(err.response.data);
				const data = err.response.data;
				if ("validation-errors" in data) {
					data["validation-errors"].forEach(({ errors }) => logger.error(errors));
					logger.error("args", JSON.stringify(args, null, 2));
				}
				if (data.status == 401 && data.title === "Unauthorized") {
					logger.debug("Нужно обновить токен");
					return refreshToken().then(() => authChecker(request)(...args));
				}
				throw err;
			});
		};
	};

	const requestAccessToken = () => {
		return axios
			.post<GetTokenRes>(`${ROOT_PATH}/oauth2/access_token`, {
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

	const getAccessToken = async (): Promise<String> => {
		if (access_token) {
			return Promise.resolve(access_token);
		}
		try {
			const content = fs.readFileSync(AMO_TOKEN_PATH);
			const token = JSON.parse(content);
			console.log(token)
			access_token = token.access_token;
			refresh_token = token.refresh_token;
			return Promise.resolve(token);
		} catch (error) {
			logger.error(`Ошибка при чтении файла ${AMO_TOKEN_PATH}`, error);
			logger.debug("Попытка заново получить токен");
			const token = await requestAccessToken();
			fs.writeFileSync(AMO_TOKEN_PATH, JSON.stringify(token));
			access_token = token.access_token;
			refresh_token = token.refresh_token;
			return Promise.resolve(token);
		}
	};
	const refreshToken = () => {
		return axios
			.post<GetTokenRes>(`${ROOT_PATH}/oauth2/access_token`, {
				client_id: config.CLIENT_ID,
				client_secret: config.CLIENT_SECRET,
				grant_type: "refresh_token",
				refresh_token: refresh_token,
				redirect_uri: config.REDIRECT_URI,
			})
			.then((res) => {
				logger.debug("Токен успешно обновлен");
				const token = res.data;
				fs.writeFileSync(AMO_TOKEN_PATH, JSON.stringify(token));
				access_token = token.access_token;
				refresh_token = token.refresh_token;
				return token;
			})
			.catch((err) => {
				logger.error("Не удалось обновить токен");
				logger.error(err.response.data);
			});
	};

	this.getAccessToken = getAccessToken;
	// Получить сделку по id
	this.getDeal = authChecker((id, withParam = []) => {
		return axios
			.get<GetDealRes>(
				`${ROOT_PATH}/api/v4/leads/${id}?${querystring.encode({
					with: withParam.join(","),
				})}`,
				{
					headers: {
						Authorization: `Bearer ${access_token}`,
					},
				}
			)
			.then((res) => res.data);
	});

	// Получить сделки по фильтрам
	this.getDeals = authChecker(({ page = 1, limit = LIMIT, filters }) => {
		const url = `${ROOT_PATH}/api/v4/leads?${querystring.stringify({
			page,
			limit,
			with: ["contacts"],
			...filters,
		})}`;

		return axios
			.get<GetDealsRes>(url, {
				headers: {
					Authorization: `Bearer ${access_token}`,
				},
			})
			.then((res) => {
				return res.data ? res.data._embedded.leads : [];
			});
	});

	// Обновить сделки
	this.updateDeals = authChecker((data) => {
		return axios.patch(`${ROOT_PATH}/api/v4/leads`, [].concat(data), {
			headers: {
				Authorization: `Bearer ${access_token}`,
			},
		});
	});

	// Получить контакт по id
	this.getContact = authChecker((id) => {
		return axios
			.get(`${ROOT_PATH}/api/v4/contacts/${id}?${querystring.stringify({
				with: ["leads"]
			})}`, {
				headers: {
					Authorization: `Bearer ${access_token}`,
				},
			})
			.then((res) => res.data);
	});

	// Обновить контакты
	this.updateContacts = authChecker((data) => {
		return axios.patch(`${ROOT_PATH}/api/v4/contacts`, [].concat(data), {
			headers: {
				Authorization: `Bearer ${access_token}`,
			},
		});
	});

}

