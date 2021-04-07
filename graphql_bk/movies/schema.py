import graphene
from graphene_django.types import DjangoObjectType, ObjectType
from .models import Actor, Movie


# Create a GraphQL type for the actor model
class ActorType(DjangoObjectType):
    class Meta:
        model = Actor


# Create a GraphQL type for the movie model
class MovieType(DjangoObjectType):
    class Meta:
        model = Movie


# Create a Query type
class Query(ObjectType):
    actor = graphene.Field(ActorType, id=graphene.Int())
    movie = graphene.Field(MovieType, id=graphene.Int())
    actors = graphene.List(ActorType)
    movies = graphene.List(MovieType)

    def resolve_actor(self, info, **kwargs):
        actor = Actor.objects.filter(pk=kwargs.get('id')).first()
        if not actor:
            return None

        return actor

    def resolve_movie(self, info, **kwargs):
        movie = Movie.objects.filter(pk=kwargs.get('id')).first()
        if not movie:
            return None

        return movie

    def resolve_actors(self, info, **kwargs):
        return Actor.objects.all()

    def resolve_movies(self, info, **kwargs):
        return Movie.objects.all()


# Create Input Object Types
class ActorInput(graphene.InputObjectType):
    id = graphene.ID()
    name = graphene.String()


class MovieInput(graphene.InputObjectType):
    id = graphene.ID()
    title = graphene.String()
    actors = graphene.List(ActorInput)
    year = graphene.Int()


# Create mutations for actors
class CreateActor(graphene.Mutation):
    class Arguments:
        input = ActorInput(required=True)

    ok = graphene.Boolean()
    actor = graphene.Field(ActorType)

    @staticmethod
    def mutate(root, info, input=None):
        actor_instance = Actor.objects.create(name=input.name)
        return CreateActor(ok=True, actor=actor_instance)


class UpdateActor(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)
        input = ActorInput(required=True)

    ok = graphene.Boolean()
    actor = graphene.Field(ActorType)

    @staticmethod
    def mutate(root, info, id, input=None):
        actor_instance = Actor.objects.filter(pk=id).first()
        if not actor_instance:
            return UpdateActor(ok=False, actor=None)
    
        actor_instance.name = input.name
        actor_instance.save()
        return UpdateActor(ok=True, actor=actor_instance)


class DeleteActor(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)

    ok = graphene.Boolean()

    @staticmethod
    def mutate(root, info, id):
        obj = Actor.objects.filter(pk=id).first()
        if obj:
            obj.delete()
            return DeleteActor(ok=True)
        
        return DeleteActor(ok=False)


class CreateMovie(graphene.Mutation):
    class Arguments:
        input = MovieInput(required=True)

    ok = graphene.Boolean()
    movie = graphene.Field(MovieType)

    @staticmethod
    def mutate(root, info, input=None):
        actor_ids = [actor.get('id') for actor in input.actors]
        actors = Actor.objects.filter(pk__in=actor_ids)
        if not actors:
            return CreateMovie(ok=False, movie=None)

        movie_instance = Movie.objects.create(
          title=input.title,
          year=input.year
        )
        movie_instance.actors.set(actors)

        return CreateMovie(ok=True, movie=movie_instance)


class UpdateMovie(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)
        input = MovieInput(required=True)

    ok = graphene.Boolean()
    movie = graphene.Field(MovieType)

    @staticmethod
    def mutate(root, info, id, input=None):
        movie_instance = Movie.objects.filter(pk=id).first()
        if not movie_instance:
            return UpdateMovie(ok=False, movie=None)

        actor_ids = [actor.get('id') for actor in input.actors]
        actors = Actor.objects.filter(pk__in=actor_ids)
        if not actors:
            return UpdateMovie(ok=False, movie=None)

        movie_instance.title=input.title
        movie_instance.year=input.year
        movie_instance.save()
        movie_instance.actors.set(actors)

        return UpdateMovie(ok=True, movie=movie_instance)


class DeleteMovie(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)

    ok = graphene.Boolean()

    @staticmethod
    def mutate(root, info, id):
        obj = Movie.objects.filter(pk=id).first()
        if obj:
            obj.delete()
            return DeleteMovie(ok=True)

        return DeleteMovie(ok=False)
        

class Mutation(graphene.ObjectType):
    create_actor = CreateActor.Field()
    update_actor = UpdateActor.Field()
    delete_actor = DeleteActor.Field()
    create_movie = CreateMovie.Field()
    update_movie = UpdateMovie.Field()
    delete_movie = DeleteMovie.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)