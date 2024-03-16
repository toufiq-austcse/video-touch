const Data = ({ label, value }: { label: string, value: string }) => {
  return <div className={'flex justify-items-start'}>
    <p className={'min-w-32 font-bold'}>{label}</p>
    <p className={'font-normal '}> {value}</p>
  </div>;
};
export default Data;