import api from "../api";
import {Request, RequestHandler, Response} from "express";
import {getFieldValues} from "../utils";
import {RequestDealHandler} from "../types";


export const dealHandler = async <T, U>(req: Request<T>, res: Response<string>): Promise<unknown> => {
	try {
		const {update} = req.body.leads

		console.log(update);

		const [{id: dealId, custom_fields}] = update
		const {_embedded, price} = await api.getDeal({id: dealId, withParam: ["contacts"]})
		const {contacts} = _embedded
		console.log("хук сработл")
		for (const contact of contacts) {
			if (contact.is_main) {
				console.log("is main")
				const dealValues: string[] = custom_fields ? getFieldValues(custom_fields, custom_fields[0].id) : [];
				const {custom_fields_values} = await api.getContact(contact.id)
				const budget = custom_fields_values.reduce(
					function (acc, obj) {
						return dealValues.includes(obj.field_name) ? acc + Number(obj.values[0].value) : acc
					}, 0)
				console.log(update[0])
				if (price !== budget) {
					console.log("price !== => await")
					const data = {
						id: Number(dealId),
						price: budget,
						modified_user_id: '5',
					};
					await api.updateDeals(data)
					await api.createTask({
						task_type_id: 1,
						text: "Встретиться с клиентом Иван Иванов",
						complete_till: 1588885140,
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
			'pizdec'
		)
		return res.send(JSON.stringify(e)).status(400);
	}
}
