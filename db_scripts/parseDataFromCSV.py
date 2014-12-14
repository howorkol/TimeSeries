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

ind1 = 0
ind2 = ""
ind3 = ""
curr_line = 1
for line in input_file:
	if curr_line > 6:
		line = line.split(';')
		if line[1].isdigit(): break
		for i in range(0, 15):
			if i == 0:
				ind1 = "2013"
				ind2 = line[41]
				ind3 = '"' + line[59] + '"'
			elif i < 3:
				ind1 = str(2013 - i)
				ind2 = line[42 + i]
				ind3 = '"' + line[59 + i] + '"'
			elif i == 14:
				ind1 = str(2013 - i)
				ind2 = line[42 + i]
				ind3 = 'NULL'
			else:
				ind1 = str(2013 - i)
				ind2 = line[43 + i]
				ind3 = '"' + line[59 + i] + '"'

			cursor.execute('insert into companydata values ("' + line[1] + '", ' + \
						ind1 + ', "' + ind2 + '", ' + ind3 + ')')
			db.commit()

	curr_line += 1

