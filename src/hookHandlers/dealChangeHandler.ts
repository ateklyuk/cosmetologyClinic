import api from "../api";
import {Request, Response} from "express";
import {getFieldValues} from "../utils";
import {ENTITY_TYPE, ONE_DAY_TIME_UNIX, TASK_TYPE_ID} from "../../consts/consts";

export const dealHandler = async <T, U>(req: Request<T>, res: Response): Promise<Response> => {
	try {
		const {update} = req.body.leads
		const [{id: dealId}] = update
		const createTaskData = {
			task_type_id: TASK_TYPE_ID,
			text: "Проверить бюджет",
			complete_till: ONE_DAY_TIME_UNIX,
			entity_id: Number(dealId),
			entity_type: ENTITY_TYPE
		}
		const {_embedded, price, custom_fields_values: dealCustomField} = await api.getDeal({
			id: Number(dealId),
			withParam: ["contacts", "is_price_modified_by_robot", "catalog_elements"]
		})
		const {contacts} = _embedded
		for (const contact of contacts) {
			if (contact.is_main) {
				const fieldId = dealCustomField ? dealCustomField.filter(item => item.field_name === "Услуги")[0].field_id : null
				const dealValues = dealCustomField ? getFieldValues(dealCustomField, fieldId) : [];
				const {custom_fields_values} = await api.getContact(contact.id)
				const budget = custom_fields_values.reduce((acc, custom_field) => {
					return dealValues.includes(custom_field.field_name) ? acc + Number(getFieldValues([custom_field], custom_field.field_id)[0]) : acc}, 0)
				if (price === budget) {
					return res.send("Бюджет не изменился").status(200)
				}
				const data = {
					id: Number(dealId),
					price: budget
				};
				await api.updateDeals(data)
				const task = await api.getTasks(Number(dealId))
				if (!task.data) {
					await api.createTask(createTaskData)
					return res.send("Тасок нет, поэтому создана").status(200)
				}
				const {tasks} = task.data._embedded
				if (!tasks.find(task => task.task_type_id === TASK_TYPE_ID)) {
					await api.createTask(createTaskData)
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
