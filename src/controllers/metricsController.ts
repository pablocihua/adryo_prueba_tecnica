import { Request, Response } from "express";
import { Between } from "typeorm";

import { queryMetricsCountAndGroupBy, totalLeads } from "../repositories/lead.repository"
import { saveHistory } from "../repositories/history.repository";

const getMetrics = async (req: Request, res: Response): Promise<void> => {
    let status = 200;
    let response: any = {};
    const { user, query } = req;

    try {
        const { from, to } = query;
        let range = {};

        if( from && to )
            range = { where: {
                    createdAt: Between( from, to ),
                },
            };
        const [ item, totalCount ] = await totalLeads(range);
 
        range = { from, to }
        const stages =await queryMetricsCountAndGroupBy(
            {"field": 'stage', range}
        );
        const sources =await queryMetricsCountAndGroupBy(
            {field: 'source', range }
        );
        const advisorTopFive =await queryMetricsCountAndGroupBy(
            { field: 'assignedTo', range, limit: 5 }
        );
        response.message += "We are working!";

        response = { ... {
            totalLeads: totalCount,
            stages,
            sources,
            advisorTopFive
        }};

        await saveHistory({
            log: JSON.stringify({
                file: 'controller.metrics.getMetrics',
                case: 'get-try',
                message: response.message,
            }),
            createdBy: user.id || 0
        });
    } catch( error: any ){
        status = 500
        response.message = `Internal Server. ${error.message}`
        await saveHistory({
            log: JSON.stringify({
                file: 'controller.metrics.getMetrics',
                case: 'get-catch',
                message: error.message,
            }),
            createdBy: user.id || 0
        });
    }

    res.status( status ).json( response );
}

export { getMetrics }