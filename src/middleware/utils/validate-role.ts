import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export const validateIsAdvisor = ( decoded: JwtPayload, req: any ) => {
    let assignedTo: any = null;
    let { method, url, body} = req;

    if( method == 'POST'
    // && !url.includes('/:')
    && String(url).endsWith('/leads')
    && body
    && decoded.role.toLowerCase() == "advisor"){
        assignedTo = decoded.id.toString();
    }

    return assignedTo;
}