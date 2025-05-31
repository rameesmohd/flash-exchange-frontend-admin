import React, { useState, useEffect } from "react";
import { Card, Spin, Empty, List, Image, Tag, Button, Popconfirm, message, Flex ,Typography,Radio} from "antd";
import { masterGet, masterPatch } from "../../services/masterApi"; // Replace with masterPut or masterPost if needed
import moment from "moment";
const {Text} = Typography

const Helpcenter = () => {
  const [helpRequests, setHelpRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null); // Track which request is being updated
  const [queryObjects, setQueryObjects] = useState({
    status: 'submitted',
  });

  useEffect(() => {
    fetchHelpRequests();
  }, [queryObjects]);

  const fetchHelpRequests = async () => {
    try {
      setLoading(true);
      const response = await masterGet(`/help-center?status=${queryObjects.status}`);
      if (response && response.result) {
        setHelpRequests(response.result);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (ticketId) => {
    setUpdating(ticketId);
    try {
      // Replace with actual API call to update the status
      await masterPatch(`/help-center?ticket_id=${ticketId}`);

      // Update state to reflect the new status (for instant UI update)
      setHelpRequests((prevRequests) =>
        prevRequests.map((request) =>
          request._id === ticketId
            ? { ...request, status: "resolved" } // Change status accordingly
            : request
        )
      );
      message.success("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Failed to update status!");
    } finally {
      setUpdating(null);
    }
  };

  const handleStatusChange = (e) => {
    setQueryObjects((prev) => ({
      ...prev,
      status: e.target.value.toLowerCase(),
      // currentPage: 1,
    }));
  };

  return (
    <div className="sm:p-6">
      <Flex justify="space-between">
              <h2 className="text-2xl font-bold mb-4">Help Requests</h2>
              <Radio.Group className='mx-1' onChange={handleStatusChange} defaultValue='submitted'>
                    <Radio.Button value='submitted'>Submitted</Radio.Button>
                    <Radio.Button value='resolved'>Resolved</Radio.Button>
                    <Radio.Button value=''>All</Radio.Button>
              </Radio.Group>
      </Flex>
      {loading ? (
        <div className="flex justify-center">
          <Spin size="large" />
        </div>
      ) : helpRequests.length === 0 ? (
        <Empty description="No help requests found" />
      ) : (
        <List
          grid={{ gutter: 16, column:2}}
          dataSource={helpRequests}
          renderItem={(request) => (
            <List.Item>
              <Card className="" title={<Flex className="capitalize" align="center" justify="space-between">
               {request.category}
                {request.status === "submitted" && 
                  <Popconfirm
                    title="Are you sure you want to mark this as resolved?"
                    onConfirm={() => handleChangeStatus(request._id)}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{style :{backgroundColor: "grey"}}}
                  >
                    <Button
                      type="default"
                      className="mt-3 border-green-400"
                      loading={updating === request.ticket_id}
                      disabled={updating !== null}
                    >
                      Mark as Resolved
                    </Button>
                  </Popconfirm>}
              </Flex> 
                } bordered>
                <div>
                <p>
                  <strong>Email:</strong> {request.user_id?.email}
                </p>
                <p>
                  <strong>Ticket ID:</strong> {request.ticket_id}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <Tag color={request.status === "submitted" ? "blue" : "green"}>
                    {request.status.toUpperCase()}
                  </Tag>
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {moment(request.createdAt).format("YYYY-MM-DD HH:mm")}
                </p>
                </div>
                <p className="mt-2">{request.description}</p>

                {/* Display uploaded images */}
                {request.uploads?.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {request.uploads.map((image, imgIndex) => (
                      <Image
                        key={imgIndex}
                        src={image}
                        alt={`Request ${imgIndex + 1}`}
                        className="rounded-lg border"
                        width={100}
                        height={100}
                      />
                    ))}
                  </div>
                )}

               
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default Helpcenter;
