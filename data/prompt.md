# PROMPTING

## Data Manipulation
```
@data/screening69_su.csv update hcode column of this file by comparing hospital name and province_id columns with name and province_id fields respectively of @data/hospcode_202605291921.sql and update all year rows equal to 2569
```

```
@data/screening69_su.csv update hcode column of this file by comparing hospital name and province_id columns with name and province_id fields respectively of @data/hospcode_202605291921.sql and update all year rows equal to 2569. The hcode column should be string type with 5 digits length and can be prefix by 0 
```

```
please write all skipped rows to skipped_hospitals_2569.csv file
```

## Coding
```
@components/dashboard/RegionalPerformance.tsx set percentage text color of coverage according to if equal or more than 80% to primary else if equal or more then 60% and less than 80% to lime color else if equal or more then 40% and less than 60% to amber color else if equal or more then 20% and less than 40% to orange color else if less than 20% to rose color
```

```
review all input controls of the whole app that are consistency with style, size and what they are look like
```

```
reflactor @app/population/screening/[id]/ by hidding follow-up button they have already had 2nd round screening data and add dropdown action button to section of 2 round results with edit menu instead
```

```
create sidebar menu that hide by default and if user's screen width less than 768px or md size, Navbar will show its trigger button instead
```