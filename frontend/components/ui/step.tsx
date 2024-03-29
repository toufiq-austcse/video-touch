const Step = ({
  title,
  isFinal = false,
}: {
  title: string;
  isFinal?: boolean;
}) => {
  return (
    <div>
      <div>
        <div className={"flex"}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fill-rule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
              clip-rule="evenodd"
            />
          </svg>

          {!isFinal && (
            <div className={"py-2.5 pl-4 pr-4"}>
              <div
                className={"p-0 border-t-2 border-indigo-500 min-w-32"}
              ></div>
            </div>
          )}
        </div>
      </div>
      <p className={"font-bold"}>{title}</p>
      <p className={"font-light"}>{new Date().toDateString()}</p>
      <p className={"font-light"}>5:25 pm</p>
    </div>
  );
};

export default Step;
