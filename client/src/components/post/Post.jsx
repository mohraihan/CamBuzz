import "./post.scss";
import MoreIcon from "@mui/icons-material/MoreVertRounded";
import { Link } from "react-router-dom";
import CommentIcon from "@mui/icons-material/ChatOutlined";
import ShareIcon from "@mui/icons-material/SendOutlined";
import LikeIcon from "@mui/icons-material/FavoriteBorderRounded";
import LikedIcon from "@mui/icons-material/FavoriteRounded";
import Comments from "../comments/Comments";
import moment from "moment";
import { useContext, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import Loader from "../loader/Loader";

const Post = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const { isLoading, error, data } = useQuery(["likes", post.postid], () =>
    makeRequest.get("/likes?postid=" + post.postid).then((res) => {
      return res.data;
    })
  );
  const { isLoading: cLoading, error: cError, data: cData } = useQuery(["comments", post.postid], () =>
    makeRequest.get("/comments?postid=" + post.postid).then((res) => {
      return res.data;
    })
  );

  const queryClient = useQueryClient();

  const mutation = useMutation(
    (liked) => {
      if (liked) return makeRequest.delete("/likes?postid=" + post.postid);
      return makeRequest.post("/likes", { postid: post.postid });
    },
    {
      onSettled: () => {
        setLoading(false);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["likes"]);
      },
    }
  );
  const delMutation = useMutation(
    (postData) => {
      return makeRequest.delete("/posts?postid=" + postData.postid + "&type=" + postData.type);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["posts"]);
      },
    }
  );

  const handleLike = async () => {
    setLoading(true)
    mutation.mutate(data.includes(currentUser.username));
  };

  const handleDelete = () => {

    delMutation.mutate({ postid: post.postid, type: currentUser.type });
  };

  return (
    <div className="post">
      <div className="container" >
        <div className="user">
          <div className="userInfo">
            <img src={"/profile/" + post.profilePic} alt="" />
            <div className="detail">
              <Link
                to={`/profile/${post.username}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{post.username}</span>
              </Link>
              <span className="date">{moment(post.createdAt).fromNow()}</span>
            </div>
          </div>
          <MoreIcon onClick={() => setMoreOpen(!moreOpen)} />
          {moreOpen && post.username === currentUser.username && (
            <button onClick={handleDelete}>Delete</button>
          )}
        </div>
        <div className="content">
          <img src={"/posts/" + post.img} alt="Unable to load" />
          <p>{post.desc}</p>
        </div>
        <div className="info">
          <div className="item">
            <div className="likeico" style={{ position: "relative" }}>
              {isLoading ?
                (<Loader size={35} color={"black"} noBg={true} />)
                : data?.includes(currentUser.username) ? <>
                  <LikedIcon style={{ color: "#6b173e" }} onClick={handleLike} />
                  {loading && <Loader size={10} dColor={"white"} lColor={"white"} noBg={true} />}</>
                  : <>
                    <LikeIcon style={{ color: "#6b173e" }} onClick={handleLike} />
                    {loading && <Loader size={10} lColor={"black"} dColor={"white"} noBg={true} />}</>
              }
            </div>
            {data ? data.length + " Likes" : error}
          </div>
          <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
            <CommentIcon />{cLoading ? <Loader size={15} lColor={"white"} dColor={"white"} noBg={false} /> : cData ? cData.length + " Comments" : cError}
          </div>
          <div className="item">
            <ShareIcon />
            Share
          </div>
        </div>
        {commentOpen && <Comments postid={post.postid} comments={cData} />}
      </div>
    </div>
  );
};

export default Post;
