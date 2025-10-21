import React from 'react';
import useTasks from '../hooks/useTasks'; // We use useTasks because notifications are in the same context
import moment from 'moment';

const BellIcon = () => <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;

const NotificationsPage = () => {
  const { notifications, loading } = useTasks();

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Notifications</h1>
      <div className="flow-root">
        <ul className="-mb-8">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <li key={notification._id}>
                <div className="relative pb-8">
                  {index !== notifications.length - 1 ? (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                        <BellIcon />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: notification.message }}></p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time dateTime={notification.createdAt}>{moment(notification.createdAt).fromNow()}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <p className="text-gray-500">You have no new notifications.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default NotificationsPage;