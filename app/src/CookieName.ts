enum CookieName {
    /** The API ID of the client's app, used for integrity verification of the frontend. */
	API_ID = 'apiId',
	/** The session token used for managing authorized actions of the user's account. */
    SESSION_TOKEN = 'sessionToken',
	/** The session token used during the client login. */
	LOGIN_SESSION_TOKEN = 'loginSessionToken',
}

export default CookieName