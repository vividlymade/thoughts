declare global {
	namespace NodeJS {
		interface ProcessEnv {
			TEST_EMAIL: string
			TEST_NAME: string
			TEST_HANDLE: string
			TEST_PASSWORD: string
		}
	}
}

export {}