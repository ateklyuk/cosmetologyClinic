import {stringify} from "querystring";
import {Request, Response} from "express";
import api from "../api";

const taskTypeId = 3267826
const entityId= 800719
const entityType = "leads"

export const taskHandler = async <T,U>(req: Request<T>, res: Response<string>): Promise<unknown> => {
	try {
		const body = req.body
		const {update} = body.task
		const changeTaskId = update[0].task_type
		const changeEntityId = update[0].element_id
		if (changeTaskId == taskTypeId && changeEntityId == entityId){
			const data = {
				entity_id: entityId,
				note_type: "common",
				params: {
					text:"Бюджет проверен, ошибок нет"
				}
			}
			await api.createNote(data)
			console.log("создана")
		}
		console.log(changeTaskId, changeEntityId)
	}	catch (e: unknown){
		return res.send(JSON.stringify(e)).status(400)
	}
}
