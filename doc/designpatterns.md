#Design Patterns

Factory design is being used in this project. Factories allow objects to be created but do not reveal how they are instantiated. The turret, enemy, and bullet classes
all adhere to this design pattern and have internal instantiation. This pattern works well in the project because each game object can be set up the same way each time
with it's own update method. If new objects need to be added, new classes will be made that adhere to this design pattern. We will also be altering attributes of the 
object classes to allow the game to have more features.