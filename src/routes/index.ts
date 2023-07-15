import { Router } from "express";

import contact from './contact'

const router = Router();

export default (): Router => {
    contact(router);
    return router;
}
