/**
 * Модуль содержит ключи интеграции и другие конфигурации
 */
import {Config} from "./types"

export const config: Config = {
	// данные для api amocrm
	CLIENT_ID: "63164d5e-aef4-41ee-9854-5f7094743321",
	CLIENT_SECRET: "CWVt0kBxbh5YIUwBqI69nXvJ3tMx0fHKw86X0JtWGu5lPIBpXLwGdS8ZvQYVpdi0",
	//AUTH_CODE живет 20 минут, при перезапуске скрипта нужно брать новый
	AUTH_CODE: "def5020028b0424391e6bc0686e38ea0bcc5712fc4a99692c8cb831f3dba16291ef6255e45d466a4c9a1430e74133e6a007997cc16ef89d5eff233004f2660fc464b5bced065942d09fe8221826958fd3b439f26e400a19ad620283f47944038319dcd40141ba83e2df4bca998126d48130b92b17d8c93250d3442946d60792192ac130fa6989f2ab25dc83ea56b10f3bf79858ab6cb6a795a072adfad1e7dd274d3e25ed1d30bc3693cc36c6ffd9415d9a458bc3fc489a4bd4e0dd921efd2426f433a64b35091731ff7b23feaf09215ed6ebd5270d3b2eb3d5e182071d217767b69a6708ebba1c9388d53abcbc7bbece5361391a493f538a62a2aa0b7015159a9f30f5e42a87e0c60dda661b83bf69814b319a1e02d7d8f30c87c2ceeaa79a2989b52c9aa0961c46dc7e0d74abb04f95c4eb4ef1153f9d3870bfdf583bbd33cdca9f240fe969d76d54f9d8647fc4ab3eae57123216a72623d0c31ead36fd21d0984bcd4bea6100d6809fcb50cc69aafd445574e9d1241177b60894504616a9caedf92f0284d434ea4e3ee760365aa170fc216984663542af3fb89a1f7466289ffd1b415892f920ed173e8bb900b8405b003316f090f744319846dfc8dc3f31490c95f75207659e90dc49561e2790e87ce80136a226c54779087e53eab21e2ce1f6c1d37743fee98e8fa0f8d7fd82e5817f47e401dff3bb0",
	REDIRECT_URI: "https://78c7-77-95-90-50.ngrok-free.app",
	SUB_DOMAIN: "ateklyuktech",
	// конфигурация сервера
	PORT: 2000,
};

