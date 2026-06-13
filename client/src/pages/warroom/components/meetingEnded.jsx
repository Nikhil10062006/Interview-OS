import { useNavigate } from "react-router-dom";
import Modal from "../../../components/modal.jsx";
export default function MeetingEnded() {
  const navigate = useNavigate();
  return (
    <Modal
      isOpen
      onClose={() => navigate("/warroom/all-rooms")}
      title={
        "The Meeting has been ended by the interviewer.Best of luck for your results."
      }
    ></Modal>
  );
}
