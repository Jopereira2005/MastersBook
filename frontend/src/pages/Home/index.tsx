import styled from'./style.module.css';

// O nome da function tem que seguir o nome da pasta, no caso Home.
export default function Home() {
  return (
    <div className={ styled.home }>
      <h1>Hello World</h1>
    </div>
  );
}
