
export type Config = {
	CLIENT_ID: string,
	CLIENT_SECRET: string,
	AUTH_CODE: string,
	REDIRECT_URI: string,
	SUB_DOMAIN: string,
	PORT: number
}
export type DataType = {
	client_id: string,
	client_secret: string,
	redirect_uri: string,
	grant_type: string,
	code?: string,
	refresh_token?: string | null,
}

export type PostTokenData = {
	client_id: string,
	client_secret: string,
	grant_type: string,
	refresh_token: string,
	redirect_uri: string,
}

export type RequestQuery = {
	id?: number,
	limit?: number,
	page?: number,
	filters?: number[],
	withParam?: string[]
}
export type CustomField = {
	field_id: number,
	field_name: string,
	id: number,
	values: { value: string }[],
}
export type Token = {
	access_token: string,
	refresh_token: string
}

export type DealRes = {
	custom_fields_values: CustomField[],
	id: number,
	name: string,
	price: number,
	responsible_user_id: number,
	group_id: number,
	status_id: number,
	pipeline_id: number,
	_embedded: {
		contacts: [
			{
				id: number,
				is_main: boolean,
			}]
	}
}


export type DealsUpdateData = {
	id: number,
	price: number
}

export type ContactRes = {
	id: number,
	name: string,
	first_name: string,
	last_name: string,
	responsible_user_id: number,
	custom_fields_values: CustomField[]
}

export type ContactsUpdateData = {
	id: number,
	first_name: string,
	last_name: string,
	custom_fields_values: {}[]
}

export type RequestDealHandler = {
	leads: {
		update: [{
			id: string,
			custom_fields: object[]
		}]
	}
}

export type CreateTaskData = {
	text: string,
	task_type_id: number,
	complete_till: number,
	entity_id: number,
	entity_type: string
}
export type CreateNoteData = {
	entity_id: number,
	note_type: string,
	params: {
		text: string
	}
}
export type FieldsResponse = {
	field_id: number,
	values:
		[
			{
				value: unknown,
				enum_id: number
			}]
}

export type TaskData = {
	task_type_id: number,
	text: string,
	complete_till: number,
	entity_id: number,
	entity_type: string
}
export type NoteData = {
	entity_id: number,
	note_type: string,
	params: {
		text: string
	}
}
