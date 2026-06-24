import express from 'express';
import { index, show, update } from '../handlers/users';

const router = express.Router();

router.get('/', index);
router.get('/:id', show);
router.put('/:id', update);

export default router;
