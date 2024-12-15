const express = require('express');
import { webHookVerification } from './webHooksVerification'
import { orderCreateHandler } from './webhooksHandler'
export const shopifyWebHookRoutes = express.Router()

shopifyWebHookRoutes.post('/orderCreate', webHookVerification, orderCreateHandler )
