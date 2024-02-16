import {getFieldValue} from "../utils";
import api from "../api";
import {Request, Response} from "express";
import calcBudget from "../calcBudget/calcBudget";

const BDAY_FIELD_ID = 81223;
const CUSTOM_FIELD_ID = 162427;


export default async function hookHandler<T, U>(req: Request<T>, res: Response<string>): Promise<unknown> {
	try {
		// const {contacts} = req.body;
		// console.log(req)
		// const [{custom_fields, id: contactId}] = contacts.add;
		// const value = getFieldValue(custom_fields, BDAY_FIELD_ID);
		// const age = calcBudget();
		// const data = {
		// 	id: 54884,
		// 	price: 50000,
		// 	pipeline_id: 47521,
		// 	status_id: 525743,
		// 	_embedded: {
		// 		tags: null
		// 	}
		// };
		// res.send("OK");
		// return await api.updateDeals(data, contactId);
		const id = req.body.leads.update[0].id;
		const data = await api.getDeal(id, ["contacts",])
		console.log(req.body.leads.update[0])
		console.log(data)
		return req.body
	} catch (e: unknown) {
		return res.send(JSON.stringify(e));
	}
};
