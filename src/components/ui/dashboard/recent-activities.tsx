
import DashboardCard from './dashboard-card';
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  timelineOppositeContentClasses,
} from '@mui/lab';
import { Link, Typography } from '@mui/material';

interface RecentActivitiesProps {
  data: {
    activity: string;
    message: string;
    time: string;
  }[]
}

const RecentActivities : React.FC<RecentActivitiesProps> = ({data}) => {
  return (
    <DashboardCard contentPadding='30px' title="Recent Activities">
      <>
        <Timeline
          className="theme-timeline"
          nonce={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
          sx={{
            p: 0,
            mb: '-40px',
            '& .MuiTimelineConnector-root': {
              width: '1px',
              backgroundColor: '#efefef'
            },
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: 0.5,
              paddingLeft: 0,
            },
          }}
        >
          {data.length == 0 && 
            <TimelineItem>
              <Typography>No recent activities found</Typography>
            </TimelineItem>
          }
          {data.map((item, index) => {
            const isLastItem = index === data.length - 1;
            return (
              <TimelineItem key={index}>
              <TimelineOppositeContent>{item.time}</TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color={(item.activity.toLowerCase() == "created" || item.activity.toLocaleLowerCase() == "finished" || item.activity.toLowerCase() == "added") ? "success" : item.activity.toLowerCase() == "updated" ? "primary" : "error"} variant="outlined" />
                {!isLastItem && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent className={isLastItem ? 'mb-10' : ''}>{item.message}</TimelineContent>
            </TimelineItem>
            )
            })}
          {/* <TimelineItem>
            <TimelineOppositeContent>09:30 am</TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="primary" variant="outlined" />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>Payment received from John Doe of $385.90</TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineOppositeContent>10:00 am</TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="secondary" variant="outlined" />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography fontWeight="600">New sale recorded</Typography>{' '}
              <Link href="/" underline="none">
                #ML-3467
              </Link>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineOppositeContent>12:00 am</TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="success" variant="outlined" />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>Payment was made of $64.95 to Michael</TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineOppositeContent>09:30 am</TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="warning" variant="outlined" />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography fontWeight="600">New sale recorded</Typography>{' '}
              <Link href="/" underline="none">
                #ML-3467
              </Link>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineOppositeContent>09:30 am</TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="error" variant="outlined" />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography fontWeight="600">New arrival recorded</Typography>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineOppositeContent>12:00 am</TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="success" variant="outlined" />
            </TimelineSeparator>
            <TimelineContent>Payment Received</TimelineContent>
          </TimelineItem> */}
        </Timeline>
      </>
    </DashboardCard>
  );
};

export default RecentActivities;
