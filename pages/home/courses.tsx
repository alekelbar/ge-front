import { Box, Divider, Grid, Pagination, Paper, Stack, Typography, useTheme } from '@mui/material';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Loading } from '../../src/components';
import { AddFloatButton } from '../../src/components/common/AddFloatButton';
import GoHome from '../../src/components/common/Layout/GoHome';
import { AddCourseDialog } from '../../src/components/Courses/AddCourseDialog';
import CourseCard from '../../src/components/Courses/CourseCard';
import { EditCourseDialog } from '../../src/components/Courses/EditCourseDialog';
import usePagination from '../../src/hooks/pagination';
import { Course } from '../../src/interfaces/course.interface';
import { RESPONSES } from '../../src/interfaces/response-messages';
import { useAppDispatch, useAppSelector } from '../../src/redux/hooks';
import { startLoadCourses } from '../../src/redux/thunks/courses.thunks';

interface CoursesProps {

}

export default function Courses ({ }: CoursesProps) {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { selected } = useAppSelector(st => st.career);
  const coursesState = useAppSelector(st => st.courses);
  const { actualPage, handleChangePage, totalPages, setTotalPages } = usePagination(coursesState.count);

  const [courses, setCourses] = useState<Course[]>(coursesState.courses);
  const [openCreate, setOpenCreate] = useState(false);

  const onOpenCreate = () => {
    setOpenCreate(true);
  };

  const onCloseCreate = () => {
    setOpenCreate(false);
  };

  const [openEdit, setOpenEdit] = useState(false);

  const onOpenEdit = () => {
    setOpenEdit(true);
  };

  const onCloseEdit = () => {
    setOpenEdit(false);
  };


  useEffect(() => {
    // TODO: Realizar el dispatch que carga los cursos correspondientes a la carrera
    (async () => {
      if (selected) {
        const response = await dispatch(startLoadCourses(selected._id, actualPage));

        if (response !== RESPONSES.SUCCESS) {

          if (response === RESPONSES.UNAUTHORIZE) {
            router.push('/auth');
            await Swal.fire('Parece que tú sesión expiro, inicia sesión porfavor... 😥', response);
            return;
          }

          await Swal.fire('Algo salio mal 😥', response);
          return;
        }
      }
    })();
  }, [actualPage]);

  useEffect(() => {
    setCourses(coursesState.courses);

    // Cálculo para la paginación
    const pages: number =
      (coursesState.count % 5 !== 0)
        ? Math.trunc(coursesState.count / 5) + 1
        : Math.trunc(coursesState.count / 5);

    setTotalPages(pages);
  }, [coursesState]);

  if (!selected) return <GoHome />;
  if (coursesState.loading) return <Loading />;

  return (
    <Stack direction="column" sx={{ borderRadius: '.8em' }}>
      <Box position='sticky' top={0} sx={{
        backgroundColor: ({ palette }) => palette.primary.main,
        zIndex: '10'
      }}>
        <Typography align='center' bgcolor={'secondary'} variant='subtitle1'>{selected.name}</Typography>
      </Box>
      <Grid container spacing={2} direction="row" justifyContent={'center'} alignItems='center'>
        <Grid item>
          <Pagination
            page={actualPage}
            sx={{
              width: "100%",
              [theme.breakpoints.up("md")]: {
                fontSize: "large"
              },
            }}
            size="large"
            count={totalPages}
            onChange={handleChangePage}
          />
        </Grid>
      </Grid>
      <Paper variant='elevation'>
        <Grid container spacing={2} direction={'row'} justifyContent="start" alignItems={'center'}>
          {courses.map(course => {
            return (
              <Grid item xs={12} sm={4} key={course._id + course.name}>
                <CourseCard onOpenEdit={onOpenEdit} course={course} />
                <Divider variant='fullWidth' />
              </Grid>
            );
          })}
        </Grid>
        <Grid container spacing={2} direction="row" justifyContent={'center'} alignItems='center'>
          <Grid item>
            <Pagination
              page={actualPage}
              sx={{
                width: "100%",
                [theme.breakpoints.up("md")]: {
                  fontSize: "large"
                },
              }}
              size="large"
              count={totalPages}
              onChange={handleChangePage}
            />
          </Grid>
        </Grid>
      </Paper>
      <AddFloatButton onAdd={onOpenCreate} />
      <AddCourseDialog onClose={onCloseCreate} open={openCreate} />
      <EditCourseDialog onClose={onCloseEdit} open={openEdit} />
    </Stack>
  );
}


export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { token } = ctx.req.cookies;
  if (!token) {
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      },
    };
  }

  return {
    props: {}
  };
};
