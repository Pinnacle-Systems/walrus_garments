import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { FIBER_CONTENT_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const FiberContentMasterApi = createApi({
  reducerPath: "fiberContentMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["FiberContent"],
  endpoints: (builder) => ({
    getFiberContentMaster: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: FIBER_CONTENT_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: FIBER_CONTENT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["FiberContent"],
    }),
    getFiberContentMasterById: builder.query({
      query: (id) => {
        return {
          url: `${FIBER_CONTENT_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["FiberContent"],
    }),
    addFiberContentMaster: builder.mutation({
      query: (payload) => ({
        url: FIBER_CONTENT_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["FiberContent"],
    }),
    updateFiberContentMaster: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${FIBER_CONTENT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["FiberContent"],
    }),
    deleteFiberContentMaster: builder.mutation({
      query: (id) => ({
        url: `${FIBER_CONTENT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FiberContent"],
    }),
  }),
});

export const {
  useGetFiberContentMasterQuery,
  useGetFiberContentMasterByIdQuery,
  useAddFiberContentMasterMutation,
  useUpdateFiberContentMasterMutation,
  useDeleteFiberContentMasterMutation,
} = FiberContentMasterApi;

export default FiberContentMasterApi;
