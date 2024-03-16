const Step = ({ title, isFinal = false }: { title: string, isFinal?: boolean }) => {
  return (
    <div>
      <div>
        <div className={'flex'}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
               stroke="currentColor"
               className="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          {!isFinal && <div className={'py-2.5 pl-4 pr-4'}>
            <div className={'p-0 border-t-2 border-indigo-500 min-w-32'}></div>
          </div>}
        </div>
      </div>
      <p className={'font-bold'}>{title}</p>
      <p className={'font-light'}>{new Date().toDateString()}</p>
      <p className={'font-light'}>5:25 pm</p>
    </div>
  );
};

export default Step;