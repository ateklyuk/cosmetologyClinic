import api from "../api";
import {Request, Response} from "express";
import {getFieldValues} from "../utils";
import {RequestDealHandler, TaskData} from "../types";

const taskTypeId = 3267826
const entityId = 800719
const entityType = "leads"
const today = Math.floor(new Date().getTime() / 1000) + 86400
const createTaskData: TaskData = {
	task_type_id: taskTypeId,
	text: "Проверить бюджет",
	complete_till: today,
	entity_id: entityId,
	entity_type: entityType
}

export const dealHandler = async <T, U>(req: Request<T>, res: Response): Promise<Response> => {
	try {
		const {update} = req.body.leads
		const [{id: dealId}] = update
		const {_embedded, price, custom_fields_values: dealCustomField} = await api.getDeal({
			id: dealId,
			withParam: ["contacts", "is_price_modified_by_robot", "catalog_elements"]
		})
		const {contacts} = _embedded
		for (const contact of contacts) {
			if (contact.is_main) {
				const fieldId = dealCustomField ? dealCustomField.filter(item => item.field_name === "Услуги")[0].field_id : null
				const dealValues = dealCustomField ? getFieldValues(dealCustomField, fieldId) : [];
				const {custom_fields_values} = await api.getContact(contact.id)
				const budget = custom_fields_values.reduce((acc, obj) => {
					return dealValues.includes(obj.field_name) ? acc + Number(getFieldValues([obj], obj.field_id)[0]) : acc}, 0)
				if (price === budget) {
					return res.send("Бюджет не изменился").status(200)
				}
				const data = {
					id: Number(dealId),
					price: budget
				};
				await api.updateDeals(data)
				const task = await api.getTasks(entityId)
				if (task.data === '') {
					await api.createTask(createTaskData)
					return res.send("Тасок нет, поэтому создана").status(200)
				}
				if (task.data !== '') {
					const {tasks} = task.data._embedded
					if (!tasks.find(task => task.task_type_id === taskTypeId)) {
						await api.createTask(createTaskData)
					}
				}
				return res.send("OK").status(200)
			}
		}
		return res.send("Услуги не изменены").status(200)
	} catch (e: unknown) {
		console.log(e)
		return res.send(JSON.stringify(e)).status(400);
	}
}
