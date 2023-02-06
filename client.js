import axios from "axios";

console.log("client conde running");
const URI = "http://localhost:3000";
const BLOG_URI = `${URI}/blog`;
const USER_URI = `${URI}/user`;

/**
 * * 1. 데이터에 대한 요청을 직접 하는 방법 
 * 
 *  ! 성능
 *  ! blogsLimit 20 , comment limit 10 : 2~3초
 *  ! blogLimit 50, comment limit 10: 6초
 * 
  const test = async () => {
  console.time("loading time: ");
  let {
    data: { blogs },
  } = await axios.get(`${BLOG_URI}`);

  blogs = await Promise.all(
    blogs.map(async (blog) => {
      const [res1, res2] = await Promise.all([
        axios.get(`${USER_URI}/${blog.user}`),
        axios.get(`${BLOG_URI}/${blog._id}/comment`),
      ]);
      blog.user = res1.data.user;
      blog.comments = await Promise.all(
        res2.data.comments.map(async (comment) => {
          const {
            data: { user },
          } = await axios.get(`${USER_URI}/${comment.user}`);
          comment.user = user;
          return comment;
        })
      );

      return blog;
    })
  );

  console.dir(blogs[0], { depth: 10 });
  console.timeEnd("loading time: "); 
}; 
 * 
 */

/**
 * 2. populate를 활용한 방법
 *
 * ! 성능
 * ! blogsLimit 20 , comment limit 10 : 약 200ms
 * ! blogLimit 50, comment limit 10: 약 500ms
 *
 *
 * 3. nestring 활용
 * ! 성능
 * ! blogsLimit 20 , comment limit 10 : 약 50ms
 * ! blogLimit 50, comment limit 10: 약 100ms
 *
 */
const test = async () => {
  console.time("loading time: ");
  let {
    data: { blogs },
  } = await axios.get(`${BLOG_URI}`);

  // console.dir(blogs[0], { depth: 10 });
  console.timeEnd("loading time: ");
};

const testGroup = async () => {
  await test();
  await test();
  await test();
  await test();
  await test();
};

testGroup();
