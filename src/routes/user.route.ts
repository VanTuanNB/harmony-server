import { Router } from 'express';

import UserController from '@/controllers/user.controller';
import verificationEmailWithForm from '@/middlewares/verifyEmailForm.middleware';
import { authenticationUser } from '@/middlewares/authVerifyToken.middleware';

const router: Router = Router();
const userControllerInstance = new UserController();
router.get('/:id', userControllerInstance.getById.bind(userControllerInstance))
router.post(
    '/checkGmail',
    userControllerInstance.checkGmail.bind(userControllerInstance),
);
router.post(
    '/sendCode',
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
