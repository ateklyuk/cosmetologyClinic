import {Request, Response} from "express";
import api from "../api";
import {NoteData} from "../types";
const taskText = "Проверить бюджет"
const taskTypeId = 3267826
const entityId= 800719
const CreateNoteData: NoteData = {
	entity_id: entityId,
	note_type: "common",
	params: {
		text:"Бюджет проверен, ошибок нет"
	}
}
export const taskHandler = async <T,U>(req: Request<T>, res: Response): Promise<Response> => {
	try {
		const body = req.body
		const {update} = body.task
		const changeTaskId = update[0].task_type
		const changeEntityId = update[0].element_id
		const {text} = update[0]
		if (changeTaskId == taskTypeId && changeEntityId == entityId && text == taskText){
			await api.createNote(CreateNoteData)
			return res.send("OK").status(200)
		}
		return res.send("Изменилась не та задача").status(200)
	}	catch (e: unknown){
		return res.send(JSON.stringify(e)).status(400)
	}
}
