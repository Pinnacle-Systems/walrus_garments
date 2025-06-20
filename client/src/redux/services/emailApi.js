// src/services/emailApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const emailkycUpdateApi = createApi({
  reducerPath: 'emailkycUpdateApi',
  baseQuery: fetchBaseQuery({ baseUrl:  process.env.REACT_APP_SERVER_URL }), 
  endpoints: (builder) => ({
    sendKycEmail: builder.mutation({
      query: (emailData) => ({
        url: '/send-email',
        method: 'POST',
        body: emailData,
      }),
    }),
  }),
});

export const { useSendKycEmailMutation } = emailkycUpdateApi;
