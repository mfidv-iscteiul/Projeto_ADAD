import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/ListGroupItem';

function BookCard(props) {
  return (
    <Card style={{ width: '18rem' }} className="mb-3">
      <Card.Body style={{display: "flex",  flexDirection: "column"}}>
        <Card.Img variant="top" src={props.thumbnailUrl}></Card.Img>
        <Card.Title style={{textAlign: 'center', marginBottom: 1.5 + "em"}}>{props.title}</Card.Title>
        <Card.Subtitle style={{marginBottom: 0.5 + "em"}}>By:</Card.Subtitle>
        <ListGroup variant="flush">
          {props.authors &&
            props.authors.map((author) => {
              return <ListGroupItem>{author}</ListGroupItem>;
          })}
        </ListGroup>
        <h5 style={{textAlign: 'center', fontWeight: "bold", marginTop: "auto"}}>{props.price}€</h5>
      </Card.Body>
      <Card.Footer>
      <Button href={"/book/" + props._id} variant="outline-primary">Open Book</Button></Card.Footer>
    </Card>
  );
}

export default BookCard;