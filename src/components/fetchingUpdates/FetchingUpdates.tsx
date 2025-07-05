import type { StatusMessage } from "../../types";
import { ClipLoader } from "react-spinners";

interface FetchingUpdatesProps {
  statusMessages: StatusMessage[];
  rateLimited: boolean;
  isFetching: boolean;
}

const FetchingUpdates = ({
  statusMessages,
  rateLimited,
  isFetching,
}: FetchingUpdatesProps) => {
  return (
    <div className="flex flex-col min-w-64 gap-4 justify-center">
      {isFetching ? (
        <div className="text-center">
          <ClipLoader />
        </div>
      ) : (
        <></>
      )}
      <p
        className={`text-sm w-full text-center ${
          !rateLimited ? "text-transparent" : "text-red-600"
        }`}
      >
        Rate limited: retrying again in 30 seconds!
      </p>
      <ul className="flex flex-col gap-1">
        {statusMessages.map((statusMessage) => (
          <li key={statusMessage.id}>
            <div className="flex flex-row justify-start h-6 flex-nowrap gap-4">
              <p>
                {statusMessage.message +
                  (statusMessage.tasksCompleted > 0
                    ? statusMessage.tasksCompleted.toString() +
                      (statusMessage.totalTasks != -1
                        ? "/" + statusMessage.totalTasks
                        : "")
                    : "")}
              </p>
              <p className="ml-auto">{statusMessage.status}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FetchingUpdates;
