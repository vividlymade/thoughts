import ProjectPackage from '../package.json'
import HTTPCode from './HTTPCode'

function applyVariablesToErrorTemplate(errorCode: number, message: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>${ProjectPackage.fullName}</title>
</head>
<body>
    <div style="display: contents;">
        <div style="display: flex;
  justify-content: center;
  align-items: center; height: 100vh;">
            <p>${message}</p>
        </div>
    </div>
</body>
</html>`
}

const ErrorPages = {
    [HTTPCode.NOT_FOUND]: applyVariablesToErrorTemplate(HTTPCode.NOT_FOUND, "Not Found"),
    [HTTPCode.APPLICATION_DOWN_FOR_MAINTENANCE]: applyVariablesToErrorTemplate(HTTPCode.APPLICATION_DOWN_FOR_MAINTENANCE, "Application down for maintenance!")
}

export default ErrorPages
