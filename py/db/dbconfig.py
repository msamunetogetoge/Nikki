import os
DATABASE_URI = os.environ.get('DATABASE_URI')
if DATABASE_URI is None or DATABASE_URI == "":
    raise EnvironmentError
