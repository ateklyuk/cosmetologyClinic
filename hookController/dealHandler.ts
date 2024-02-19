import api from "../api";
import {Request, Response} from "express";
import {getFieldValues} from "../utils";


export default async function hookHandler<T, U>(req: Request<T>, res: Response<string>): Promise<unknown> {
	try {
		const {update} = req.body.leads
		const [{id: dealId, custom_fields}] = update
		const {_embedded, price} = await api.getDeal(dealId, ["contacts"])
		const {contacts} = _embedded
		console.log("хук сработл")
		let budget = 0;
		for (const contact of contacts) {
			if (contact.is_main) {
				console.log("is main")
				const dealValues: string[]  = custom_fields ? getFieldValues(custom_fields, custom_fields[0].id) : [];
				const {custom_fields_values} = await api.getContact(contact.id)

				for (const value of custom_fields_values) {
					if (dealValues.includes(value.field_name)){
						budget += Number(value.values[0].value)
					}
				}
				if (price !== budget){
					console.log("price !== => await")
					const data = {
						id: Number(dealId),
						price: budget
					};
					await api.updateDeals(data)
				}
			return res.send("OK").status(200)
			}
		}

	} catch (e: unknown) {
		return res.send(JSON.stringify(e)).status(400);
	}
}
