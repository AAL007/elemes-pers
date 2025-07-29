
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
        </Timeline>
      </>
    </DashboardCard>
  );
};

export default RecentActivities;
