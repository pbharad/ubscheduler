
import Login from '@/components/Login'
import Courses from '@/components/Courses'
import AddCourse from '@/components/AddCourse'
import Schedule from '@/components/Schedule'
import Questionnaire from '@/components/Questionnaire'
import ResetPassword from '@/components/ResetPassword'


export const routes = [
    {
      path: '/',
      name: 'Login',
      component: Login,
      meta:{requiresAuth : false}
    },
    {
      path: '/courses',
      name: 'Courses',
      component: Courses,
      meta:{requiresAuth : true}
    },
    {
      path: '/addcourse',
      name: 'AddCourse',
      component: AddCourse,
      meta:{requiresAuth : true}
    },
    {
      path: '/editcourse/:id',
      name: 'AddCourse',
      component: AddCourse,
      meta:{requiresAuth : true}
    },
    {
      path: '/schedule/:id',
      name: 'Schedule',
      component: Schedule,
      meta:{requiresAuth : true}
    },
    {
      path: '/schedule',
      name: 'Schedule',
      component: Schedule,
      meta:{requiresAuth : true}
    },
    {
      path: '/Questionnaire/:email/:courseid',
      name: 'Questionnaire',
      component: Questionnaire,
      meta:{requiresAuth : false}
    },
    {
      path: '/resetpassword/:email/:timestamp',
      name: 'ResetPassword',
      component: ResetPassword,
      meta:{requiresAuth : false}
    }
  ];
