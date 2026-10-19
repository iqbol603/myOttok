import React, { useEffect } from 'react';
import Today from './Day/Day.tsx';
import Week from './Week/Week.tsx';
import ThisMoth from './Week/Month/ThisMonth.tsx';
import PrevMoth from './Week/Month/PrevMonth.tsx';
import AllTime from './AllTime/AllTime.tsx';
import './Stats.css';
import { refreshDashboardToken } from '../../utils/auth';

const Stats = () => {
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                await refreshDashboardToken();
            } catch (error) {
                // Следующий запрос повторит обновление токена.
            }
            window.location.reload();
        }, 300000);

        return () => clearInterval(interval);
    }, []);

        return (
            <div className='allStat'>
                <a href='/ottok'>Отток!</a>
                <Today/>
                <Week/>
                <ThisMoth/>
                <PrevMoth/>
                <AllTime/>
            </div>
        );
}

export default Stats;