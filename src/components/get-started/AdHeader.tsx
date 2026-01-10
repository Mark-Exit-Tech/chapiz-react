// Assets - using public paths
const assets = {
  advertisment: '/assets/ad_header.png'
};
// Image removed;

const AdHeader = () => {
  return (
    <div className="absolute flex w-full items-center justify-center bg-black">
      <img
        src={assets.advertisment}
        alt="advertisment"
        className="object-cover w-full h-auto"
      />
    </div>
  );
};

export default AdHeader;
