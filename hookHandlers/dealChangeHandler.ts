import api from "../api";
import {Request, Response} from "express";
import {getFieldValues} from "../utils";


export const dealHandler = async <T, U>(req: Request<T>, res: Response): Promise<Response> => {
	try {
		const {update} = req.body.leads
		const [{id: dealId}] = update
		const {_embedded, price, custom_fields_values: dealCustomField} = await api.getDeal({id: dealId, withParam: ["contacts"]})
		const {contacts} = _embedded
		for (const contact of contacts) {
			if (contact.is_main) {
				const fieldId = dealCustomField ? dealCustomField.filter(item => item.field_name === "Услуги")[0].field_id : null
				const dealValues = dealCustomField ? getFieldValues(dealCustomField, fieldId) : [];
				const {custom_fields_values} = await api.getContact(contact.id)
				const budget = custom_fields_values.reduce((acc, obj) => {
						return dealValues.includes(obj.field_name) ? acc + Number(getFieldValues([obj], obj.field_id)[0]) : acc}, 0)
				if (price === budget) {
					return res.send("бюджет не поменялся").status(200)
				}
				const data = {
					id: Number(dealId),
					price: budget
				};
				await api.updateDeals(data)
			}
		}
		return res.send("OK").status(200)
	} catch (e) {
		return res.send(JSON.stringify(e)).status(400);
	}
}
