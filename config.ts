/**
 * Модуль содержит ключи интеграции и другие конфигурации
 */
import {Config} from "./types"

export const config: Config = {
	// данные для api amocrm
	CLIENT_ID: "63164d5e-aef4-41ee-9854-5f7094743321",
	CLIENT_SECRET: "l8Cvp2Jzof2cjdEXkTMKmPZsekxTzKjAPlo1EXJTzHOlznc4bCV7rEYIApTNgZLo",
	//AUTH_CODE живет 20 минут, при перезапуске скрипта нужно брать новый
	AUTH_CODE: "def502000841eb7a7a5da683656527509e450755a20cf2c3c9aed659a174f599f50984e5d1661fc660e1ad220f1ac8714499b73bb2df153a6f693264c82093a7615ebae3b5e7e3a7ddc8ac83246cc46c4ffa3b0cbc7a265203e45fa17283e87b1f6affbb0a6d474b3cd6dbcd30c8cec9e8293045b9d8c09cd5e99ffb84c034b472bf34196454c67a2a4ef4d4ed6f1cdfd2d184a046d5eaf787a42d89335f711fa1c3fd1f9983fda217840fa3c643aa4ec86326028651692e302133abe243135c51dd360241646c0d9c378c3771b40923aebc0ad43a074290ae753fb7b9c7c4c94affafbdfc6847d045f815e269388037f5dff32036d1456ecdef9a99e920eb0e50be2f826eaf919f2b8c167bb821f0e0dae4f8ee15363af1577cf2202d59de770a76a7a2a2ccd555e947bbedb7345f7dc94fc4ab1ff36912440eda663b4a19c8aa742e058b0c90e961a645f8ef129025bb2e784e59434bee41d8d0fcd8b1ca1c064a10136162206b83f91c4d1a75d8e7e4cc50e25347345d351f64ef94ebea0ce3e34f6c82948c97ed3247dd30032e40161ad64361f04883ae48a59eebe7b76ddba334b736250f8f0932922a13c1034bfeae20eee27f3475bcad7bccb0d64107d5a940cff089a5b9395736f624d1c247c1c1d7ef89b9deaf930c791eee441354127a763db7a967a9fd028b99395812295c77ce856b2aafca",
	REDIRECT_URI: "https://093f-77-95-90-50.ngrok-free.app",
	SUB_DOMAIN: "ateklyuktech",
	// конфигурация сервера
	PORT: 2000,
};


