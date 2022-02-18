import csv
import json
import requests
from multiprocessing import Pool
from functools import partial
import subprocess
import os
import copy

CENSUS_API_KEY = '589a5c19491698e6417c54fecc498cb43bd455cc' # add your census api key here

GROUP_QUARTERS_VARIABLES_2020_PL = {
	'total_group_quarters':'P5_001N',
	'institutionalized_population':'P5_002N',
	'ip_correctional_facilities_adults':'P5_003N',
	'ip_juvenile_facilities':'P5_004N',
	'ip_nursing_skilled-nursing_facilities':'P5_005N',
	'ip_other':'P5_006N',
	'noninstitutionalized_population':'P5_007N',
	'nip_college_university_student_housing':'P5_008N',
	'nip_military_quarters':'P5_009N',
	'nip_other':'P5_010N',
}

GROUP_QUARTERS_VARIABLES_2010_SF1 = {
	'total_group_quarters':'P042001',
	'institutionalized_population':'P042002',
	'ip_correctional_facilities_adults':'P042003',
	'ip_juvenile_facilities':'P042004',
	'ip_nursing_skilled-nursing_facilities':'P042005',
	'ip_other':'P042006',
	'noninstitutionalized_population':'P042007',
	'nip_college_university_student_housing':'P042008',
	'nip_military_quarters':'P042009',
	'nip_other':'P042010',
}

vars_2020 = ','.join([GROUP_QUARTERS_VARIABLES_2020_PL[i] for i in GROUP_QUARTERS_VARIABLES_2020_PL])
vars_2010 = ','.join([GROUP_QUARTERS_VARIABLES_2010_SF1[i] for i in GROUP_QUARTERS_VARIABLES_2010_SF1])

def get_state_2_digit_fips(state_abbr):
	s = {'AK':2,'AL': 1,'AR': 5,'AS': 60,'AZ': 4,'CA': 6,'CO': 8,'CT': 9,'DC': 11,'DE': 10,'FL': 12,'GA': 13,'GU': 66,'HI': 15,'IA': 19,'ID': 16,'IL': 17,'IN': 18,'KS': 20,'KY': 21,'LA': 22,'MA': 25,'MD': 24,'ME': 23,'MI': 26,'MN': 27,'MO': 29,'MS': 28,'MT': 30,'NC': 37,'ND': 38,'NE': 31,'NH': 33,'NJ': 34,'NM': 35,'NV': 32,'NY': 36,'OH': 39,'OK': 40,'OR': 41,'PA': 42,'PR': 72,'RI': 44,'SC': 45,'SD': 46,'TN': 47,'TX': 48,'UT': 49,'VA': 51,'VI': 78,'VT': 50,'WA': 53,'WI': 55,'WV': 54,'WY': 56}
	sfips = str(s[state_abbr]).zfill(2)
	return sfips


def get_counties(state_id):
	d = []
	with open('county-fips-codes-v2018.csv', newline='') as csvfile:
		reader = csv.DictReader(csvfile)
		for row in reader:
			if row['StateCode'] == state_id:
				d.append(row['CountyCode']) 
	return d


def iter_states_demo(states):
	for state_abbr in states:
		state_id = get_state_2_digit_fips(state_abbr)
		print('state--> ', state_id)
		counties = get_counties(state_id)
		with Pool(12) as p:
			p.map(  partial(download_and_append, state_id=state_id) , counties )
	



def download_and_append(county_id,state_id):

	#2020
	url = 'https://api.census.gov/data/2020/dec/pl?get={}&for=block:*&in=state:{}%20county:{}&key={}'.format(vars_2020,state_id,county_id, CENSUS_API_KEY)
	#2010
	#url = 'https://api.census.gov/data/2010/dec/sf1?get={}&for=block:*&in=state:{}%20county:{}&key={}'.format(vars_2010,state_id, county_id, CENSUS_API_KEY) 

	#print('request--> ', url)
	response = requests.get(url)
	t = response.text
	#print('returned--> ',url)
	file = open("source-2020.txt","a")
	file.write(t)
	file.close()


def format_demo_line(l):
	l = l.lstrip('[')
	l = l.rstrip('],\n')
	l = l.replace('"','')
	a = l.split(',')

	if a[0] == "0":
		return None

	bid = a[10] + a[11] + a[12] + a[13]

	d2020 = {}
	d2020["id"] = bid
	d2020["P5_001N"] = a[0]
	d2020["P5_002N"] = a[1]
	d2020["P5_003N"] = a[2]
	d2020["P5_004N"] = a[3]
	d2020["P5_005N"] = a[4]
	d2020["P5_006N"] = a[5]
	d2020["P5_007N"] = a[6]
	d2020["P5_008N"] = a[7]
	d2020["P5_009N"] = a[8]
	d2020["P5_010N"] = a[9]

	d2010 = {}
	d2010["id"] = bid
	d2010["P042001"] = a[0]
	d2010["P042002"] = a[1]
	d2010["P042003"] = a[2]
	d2010["P042004"] = a[3]
	d2010["P042005"] = a[4]
	d2010["P042006"] = a[5]
	d2010["P042007"] = a[6]
	d2010["P042008"] = a[7]
	d2010["P042009"] = a[8]
	d2010["P042010"] = a[9]

	return json.dumps(d2020)


	# vars2020 = '"P5_001N":{},"P5_002N":{},"P5_003N":{},"P5_004N":{},"P5_005N":{},"P5_006N":{},"P5_007N":{},"P5_008N":{},"P5_009N":{},"P5_010N":{}'\
	# 	.format(a[0],a[1],a[2],a[3],a[4],a[5],a[6],a[7],a[8],a[9])

	# vars2010 = '"P042001":{},"P042002":{},"P042003":{},"P042004":{},"P042005":{},"P042006":{},"P042007":{},"P042008":{},"P042009":{},"P042010":{}'\
	# 	.format(a[0],a[1],a[2],a[3],a[4],a[5],a[6],a[7],a[8],a[9])

	#s = "{" + '"id": ' + bid + "," + vars2010 + "}\n"

	#subprocess.run(["ndjson-split", "'d.features' < geo/b/{}.geojson > geo/ndjson/{}.geojson".format(state_abbr,state_abbr)])
	

def convert_demo_to_object():
	with open('source-2020.txt') as rf, open('source-2020-formatted.ndjson', 'a') as wf:
		next(rf)
		for line in rf:
			line = format_demo_line(line)
			if line:
				wf.write(line + '\n')
	rf.close()
	wf.close()
	return

def get_blocks_w_pop(state_id):
	d = []
	with open('source-2010-formatted.ndjson','r') as rf:
		for line in rf:
			lid = line[7:9]
			if lid == state_id:
				d.append(line[7:22])
	print('state {} returned {} block_ids'.format(state_id, len(d)))
	return d


def iter_states_geo(states):
	for state_abbr in states:
		state_id = get_state_2_digit_fips(state_abbr)
		blocks_w_pop = get_blocks_w_pop(state_id)

		with open('geo/b/{}.geojson'.format(state_abbr.upper())) as rf, open('geo-source-2010.geojson', 'a') as wf :
			next(rf)
			next(rf)
			next(rf)
			for line in rf:
				idx = line.find('"block":')
				if idx == 0:
					continue
				bid = line[idx+10:idx+25]
				if bid in blocks_w_pop:
					wf.write(line)
			rf.close()
			wf.close()

def get_blocks_dictionary(year):
	d = {}
	file = 'source-{}-formatted.ndjson'.format(year) 
	with open(file,'r') as rf:
		for line in rf:
			lid = line[8:23]
			d[lid] = line.rstrip('\n')
	return d
			
def merge_demo_geo(states):
	blocks_dictionary = get_blocks_dictionary(2020)

	with open('geo-source-2020.geojson', 'r') as rf, open('merge-source-2020.geojson', 'a') as wf:
		for line in rf:
			idx = line.find('"block":')
			if idx == -1:
				wf.write(line)
				continue
			bid = line[idx+10:idx+25]
			props = blocks_dictionary[bid]
			idx1 = line.find('properties') + 13
			idx2 = line[idx1:].find('}')
			nline = line[:idx1].rstrip('\n') + props + line[idx1+idx2+1:]
			#nline = json.loads(nline).stringify()
			wf.write(nline)

	rf.close()
	wf.close()


def merge_demo_geo_split():
	blocks_dictionary = get_blocks_dictionary(2020)

	vard = GROUP_QUARTERS_VARIABLES_2020_PL
	#vard = GROUP_QUARTERS_VARIABLES_2010_SF1

	var_ref = {vard[k]:k for k in vard}

	with open('geo-source-2020.geojson', 'r') as rf:

		prev_st_fips = '00'

		wf = open('2020-state-files/'+prev_st_fips+'.geojson', 'a')
		wf.write('{\n"type": "FeatureCollection",\n"features": [\n')

		count = 0 
		for line in rf:
			idx = line.find('"block":')
			if idx == -1:
				continue
			st_idx = line.find('state') + 9
			st_fips = line[st_idx:(st_idx+2)]

			if st_fips != prev_st_fips:
				#wf.write(']\n}')
				wf.close()
				wf = open('2020-state-files/'+st_fips+'.geojson', 'a')
				wf.write('{\n"type": "FeatureCollection",\n"features": [\n')
				prev_st_fips = st_fips

			bid = line[idx+10:idx+25]
			props = blocks_dictionary[bid]

			#change from variable ID to descriptive label
			p = json.loads(props)
			new_props = {}
			for k in p:
				if k == 'id':
					new_props[k] = p[k]
				else: 
					new_props[var_ref[k]] = p[k]

			idx1 = line.find('properties') + 13
			idx2 = line[idx1:].find('}')
			nline = line[:idx1].rstrip('\n') + json.dumps(new_props) + line[idx1+idx2+1:]
			wf.write(nline)

		#wf.write(']\n}')
		wf.close()
		rf.close()

def make_single_category_files():
	states = ["TX", "PA", "NY"]
	fields = [
		'ip_correctional_facilities_adults',
		'ip_juvenile_facilities',
		'ip_nursing_skilled-nursing_facilities',
		'ip_other',
		'nip_college_university_student_housing',
		'nip_military_quarters',
		'nip_other',
		]
	for st in states:
		st_fips = get_state_2_digit_fips(st)
		fn = "2020-state-files/" + st_fips + ".geojson"
		f = open(fn)
		j = json.loads(f.read())
		print('here ', st_fips)

		for field in fields:
			geojson_copy = copy.deepcopy(j)
			new_feat = []
			for feat in geojson_copy['features']:
				if int(feat['properties'][field]) > 0:
					feat['properties'] = {field:feat['properties'][field]}
					new_feat.append(feat)
				else:
					pass
			geojson_copy['features'] = new_feat
			geojson_string = json.dumps(geojson_copy)
			with open('2020-state-category-files/'+st+'-'+field+'.geojson', 'w') as outfile:
				outfile.write(geojson_string)





		




def main():
	#iterate through states
	#states = ['AK','AL','AR','AZ','CA','CO','CT','DC','DE','FL','GA','HI','IA','ID','IL','IN','KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT','NC','ND','NE','NH','NJ','NM','NV','NY','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY']
	#without DC
	states = ['AK','AL','AR','AZ','CA','CO','CT','DE','FL','GA','HI','IA','ID','IL','IN','KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT','NC','ND','NE','NH','NJ','NM','NV','NY','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY']


	## gather data via api
	#iter_states_demo(states)

	## make ndjson for demographic data
	#convert_demo_to_object()

	## filter out blocks with pop from geo
	#iter_states_geo(states)

	## merge (for tiles)
	#merge_demo_geo(states)

	## merge but split by state (for state by state files)
	#merge_demo_geo_split()
	#run this following
	#TODO format in python script
	#sed -i '$ s/,$/]\n}/' state-files/*.geojson

	## make single category files (for DistrictBuilder reference layers)
	make_single_category_files()


	return

main()