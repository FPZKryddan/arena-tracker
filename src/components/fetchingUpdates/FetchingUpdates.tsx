import type { StatusMessage } from "../../types";
import { ClipLoader } from "react-spinners";

interface FetchingUpdatesProps {
  statusMessages: StatusMessage[];
  rateLimited: boolean;
  isFetching: boolean;
}

const FetchingUpdates = ({
  rateLimited,
  isFetching,
  statusMessages,
}: FetchingUpdatesProps) => {
  return (
    <>
      {isFetching && (
        <div className="fixed group top-0 left-1/2 mt-[8px] transform -translate-x-1/2 px-6 py-[4px] bg-gray-50 rounded-full flex flex-col">
          <div className="flex flex-row gap-[8px] justify-start">
            <div className="flex flex-col">
              <h1 className="text-[20px] leading-[22px] font-semibold">
                Fetching user data
              </h1>
              {statusMessages.length > 0 && (
                <p className="text-[12px] font-normal">
                  {statusMessages[statusMessages.length - 1].message +
                    (statusMessages[statusMessages.length - 1].tasksCompleted >
                    0
                      ? statusMessages[
                          statusMessages.length - 1
                        ].tasksCompleted.toString() +
                        (statusMessages[statusMessages.length - 1].totalTasks !=
                        -1
                          ? "/" +
                            statusMessages[statusMessages.length - 1].totalTasks
                          : "")
                      : "")}
                </p>
              )}
              <p
                className={`text-[10px] w-full text-center ${
                  !rateLimited ? "text-transparent" : "text-red-600"
                }`}
              >
                Rate limited: retrying again in 30 seconds!
              </p>
            </div>
            <div className="flex items-center">
              <ClipLoader />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FetchingUpdates;
