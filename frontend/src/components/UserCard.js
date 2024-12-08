import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

function UserCard(props) {
  return (
    <Card style={{ width: '18rem' }} className="mb-3">
      <Card.Body>
        <Card.Title style={{textAlign: 'center', marginBottom: 1.5 + "em"}}>{props.first_name } {props.last_name}</Card.Title>
        <Card.Text>
          <p>Profissão: {props.job}</p>
          <p>Ano de nascimento: {props.year_of_birth}</p>
          <p>Nº de reviews: {props.reviews.length}</p>
        </Card.Text>
      </Card.Body>
      <Card.Footer>
        <Button href={"/users/" + props._id} variant="outline-primary">Open User</Button>
      </Card.Footer>
    </Card>
  );
}

export default UserCard;