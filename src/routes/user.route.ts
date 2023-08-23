import { Router } from 'express';

import UserController from '@/controllers/user.controller';
import { authenticationUser } from '@/middlewares/authVerifyToken.middleware';
import verificationEmailWithForm from '@/middlewares/verifyEmailForm.middleware';

const router: Router = Router();
const userControllerInstance = new UserController();
router.get('/', userControllerInstance.getAll.bind(userControllerInstance))
router.get('/byUser', userControllerInstance.getAllByUser.bind(userControllerInstance))
router.get('/composer', userControllerInstance.getAllByComposer.bind(userControllerInstance))
router.get('/:id', userControllerInstance.getById.bind(userControllerInstance))
router.get('/composer/:id', userControllerInstance.getByNickName.bind(userControllerInstance))
router.post(
    '/sendCode',
    userControllerInstance.checkGmail.bind(userControllerInstance),
    userControllerInstance.createRequestAuthenticationEmail.bind(
        userControllerInstance,
    ),
);
router.post(
    '/signupForm',
    verificationEmailWithForm,
    userControllerInstance.signupForm.bind(userControllerInstance),
);
router.get(
    '/permissionComposer',
    authenticationUser,
    userControllerInstance.permissionComposer.bind(userControllerInstance),
);
router.post(
    '/upgradeComposer',
    // authenticationUser, // authentication administrator
    userControllerInstance.AskForPermissionUpgradeComposer.bind(
        userControllerInstance,
    ),
);

router
    .route('/profile')
    .put(
        authenticationUser,
        userControllerInstance.updateProfileUser.bind(userControllerInstance),
    );

export default router;
