import pyodbc
from contextlib import contextmanager

DRIVER = "{ODBC Driver 17 for SQL Server}"
SERVER = "localhost"
DATABASE = "macedo"


def get_db_connection():
    conn_str = f"DRIVER={DRIVER};SERVER={SERVER};DATABASE={DATABASE};Trusted_Connection=yes;"

    return pyodbc.connect(conn_str)


def row_to_dict(cursor, row):
    return {column[0]: value for column, value in zip(cursor.description, row)}
