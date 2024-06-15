const Data = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className={'flex justify-items-start'}>
      <div className={'min-w-32 font-bold'}>{label}</div>
      <div className={'font-normal '}> {value}</div>
    </div>
  );
};
export default Data;
