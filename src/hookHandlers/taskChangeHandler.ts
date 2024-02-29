import {Request, Response} from "express";
import api from "../api";
import { TASK_TEXT, TASK_TYPE_ID } from "../consts/consts";

export const taskHandler = async <T,U>(req: Request<T>, res: Response): Promise<Response> => {
	try {
		const body = req.body
		const {update} = body.task
		const changeTaskId = update[0].task_type
		const changeEntityId = update[0].element_id
		const CreateNoteData = {
			entity_id: Number(changeEntityId),
			note_type: "common",
			params: {
				text:"Бюджет проверен, ошибок нет"
			}
		}
		const {text} = update[0]
		if (changeTaskId == TASK_TYPE_ID  && text == TASK_TEXT){
			await api.createNote(CreateNoteData)
			return res.send("OK").status(200)
		}
		return res.send("Изменилась не та задача").status(200)
	}	catch (e: unknown){
		return res.send(JSON.stringify(e)).status(400)
	}
}
