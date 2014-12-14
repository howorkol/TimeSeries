#!/usr/bin/python

import sys
import MySQLdb

db = MySQLdb.connect(
	host="localhost",
	user="root",
	passwd="root",
	db="timeseries")
cursor = db.cursor()

input_file = open(sys.argv[1], 'r')

curr_line = 1
for line in input_file:
	if curr_line > 6:
		line = line.split(';')
		if line[1].isdigit(): break
		cursor.execute('insert into companies values ("' + line[0] + '", "' + \
					line[1] + '", "' + line[2] + '", "' + line[75] + '", ' + line[3] + ')')
		db.commit()

	curr_line += 1
