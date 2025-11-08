import moment from "moment-timezone";

const getCurrentIndianTime = () => {
  return moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
};

export default getCurrentIndianTime;