import api from "../api";
import {Request, RequestHandler, Response} from "express";
import {getFieldValues} from "../utils";
import {RequestDealHandler} from "../types";


export const dealHandler = async <T, U>(req: Request<T>, res: Response<string>): Promise<unknown> => {
	try {
		const {_embedded: emb} = await api.getTasks([])
		console.log(emb)
		const today = Math.floor(new Date().getTime()/1000) + 86400
		const {update} = req.body.leads
		const [{id: dealId}] = update
		const {_embedded, price, custom_fields_values: dealCustomField} = await api.getDeal({id: dealId, withParam: ["contacts","is_price_modified_by_robot","catalog_elements"]})
		const {contacts} = _embedded
		for (const contact of contacts) {
			if (contact.is_main) {
				const dealValues: string[] = dealCustomField ? getFieldValues(dealCustomField, dealCustomField[0].field_id) : [];
				console.log(dealValues)
				const {custom_fields_values} = await api.getContact(contact.id)
				const budget = custom_fields_values.reduce(
					function (acc, obj) {
						return dealValues.includes(obj.field_name) ? acc + Number(obj.values[0].value) : acc
					}, 0)
				if (price !== budget) {
					const data = {
						id: Number(dealId),
						price: budget
					};
					await api.updateDeals(data)

					await api.createTask({
						task_type_id: 3267826,
						text: "Проверить бюджет",
						complete_till: today,
						entity_id: 800719,
						entity_type: "leads"
					})
					return res.send("OK").status(200)
				} else {
					return res.send("бюджет не поменялся").status(200)
				}
			}
		}
	} catch (e: unknown) {
		console.log(
			e
		)
		return res.send(JSON.stringify(e)).status(400);
	}
}
